# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CharactersController, type: :controller do
  describe 'GET #index' do
    it_behaves_like 'read world items'
    it_behaves_like 'name-searchable world items'

    context 'searching for available characters within a timeline' do
      let(:world) { create :world }
      let!(:character1) { create :character, world: world }
      let!(:character2) { create :character, world: world, ends: 600 }
      let!(:character3) do
        create :character, world: world, starts: 500, ends: 1900
      end
      let!(:character4) do
        create :character, world: world, starts: 550, ends: 650
      end
      let!(:character5) { create :character, world: world, starts: 1500 }
      let!(:character6) do
        create :character, world: world, starts: 50, ends: 300
      end
      let!(:character7) do
        character = create :character, world: world
        event = create :event, world: world, starts: 500, ends: 900
        event.characters << character
        character
      end
      before do
        login(world.creator)
        get :index, format: :json,
                    params: { world_slug: world.slug, starts: 400, ends: 1000 }
      end

      it 'returns characters that overlap and are available in timeline' do
        expect(JSON.parse(response.body)['characters'])
          .to contain_exactly(hash_including('id' => character1.id),
                              hash_including('id' => character2.id),
                              hash_including('id' => character3.id),
                              hash_including('id' => character4.id))
      end
    end
  end

  describe 'POST #create' do
    it_behaves_like 'create world item'
  end

  describe 'PATCH #update' do
    it_behaves_like 'update world item'
  end
end
