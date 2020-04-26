# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TagsController, type: :controller do
  describe 'GET #index' do
    it_behaves_like 'name-searchable world items'

    context 'when searching by slugs' do
      let!(:tag1) { create :tag, slug: 'apple' }
      let!(:tag2) { create :tag, slug: 'banana', world: world }
      let!(:tag3) { create :tag, slug: 'pine-Apple', world: world }
      let(:world) { tag1.world }
      before do
        login(world.creator)
        get :index, params: { search: 'appl', world_slug: world.slug }
      end

      it do
        expect(JSON.parse(response.body)['tags'])
          .to contain_exactly(hash_including('id' => tag1.id),
                              hash_including('id' => tag3.id))
      end
    end
  end
end
