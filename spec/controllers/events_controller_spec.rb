# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EventsController, type: :controller do
  describe 'GET #index' do
    let(:world) { create :world }
    subject { JSON.parse(response.body)['events'] }

    it_behaves_like 'read world items'

    context 'when filtering to character' do
      let(:character) { create :character, world: world }
      let!(:event1) do
        event = create :event, world: world
        event.characters << character
        event
      end
      let!(:event2) { create :event, world: world }
      before do
        login(world.creator)
        get :index, format: :json, params: { world_slug: world.slug,
                                             character_id: character.id }
      end

      it { is_expected.to contain_exactly(hash_including('id' => event1.id)) }
    end

    context 'when filtering to location' do
      let(:location) { create :location, world: world }
      let!(:event1) { create :event, location: location, world: world }
      let!(:event2) { create :event, world: world }
      before do
        login(world.creator)
        get :index, format: :json, params: { world_slug: world.slug,
                                             location_id: location.id }
      end

      it { is_expected.to contain_exactly(hash_including('id' => event1.id)) }
    end

    # TODO: see if this can be extracted to world items tests once characters +
    #       locations also paginate!
    context 'when paginating' do
      let!(:event1) { create :event, world: world, starts: 500 }
      let!(:event2) { create :event, world: world, starts: 200 }
      let!(:event3) { create :event, world: world, starts: 300 }
      let!(:event4) { create :event, world: world, starts: 700 }
      before { login(world.creator) }

      context 'when not specifying where to start' do
        before do
          get :index, format: :json, params: { world_slug: world.slug,
                                               per_page: 3 }
        end

        it 'pulls a page from the 0 index' do
          is_expected.to contain_exactly(hash_including('id' => event2.id),
                                         hash_including('id' => event3.id),
                                         hash_including('id' => event1.id))
        end
      end

      context 'when specifying index' do
        before do
          get :index, format: :json, params: { world_slug: world.slug,
                                               from: 1,
                                               per_page: 2 }
        end

        it 'starts from that index' do
          is_expected.to contain_exactly(hash_including('id' => event3.id),
                                         hash_including('id' => event1.id))
        end
      end
    end
  end

  describe 'POST #create' do
    it_behaves_like 'create world item',
                    { location: { name: Faker::Address.city } }
  end

  describe 'PATCH #update' do
    it_behaves_like 'update world item',
                    { location: { name: Faker::Address.city } }

    context 'when updating participants' do
      let(:world) { create :world }
      let(:event) { create :event, world: world, creator: world.creator }
      let(:character) { create :character, world: world }
      before do
        login(event.creator)
        patch :update, format: :json,
                       params: { id: event.id,
                                 event: { participants:
                                          [{ character_id: character.id }] },
                                 world_slug: world.slug }
      end

      it do
        expect(event.reload.participants.find_by(character_id: character.id))
          .to be_present
      end
    end
  end
end
