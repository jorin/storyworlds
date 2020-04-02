# frozen_string_literal: true

require 'rails_helper'

RSpec.describe EventsController, type: :controller do
  describe 'GET #index' do
    let(:world) { create :world }

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

      it do
        expect(JSON.parse(response.body)['events'])
          .to contain_exactly(hash_including('id' => event1.id))
      end
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

      it do
        expect(JSON.parse(response.body)['events'])
          .to contain_exactly(hash_including('id' => event1.id))
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
