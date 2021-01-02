# frozen_string_literal: true

require 'rails_helper'

RSpec.describe RelationshipsController, type: :controller do
  let(:creator) { create :user }
  let(:relationship_name) { Faker::Relationship.familial }
  let(:world) { create :world, creator: creator }
  before { login(creator) }

  describe 'GET #index' do
    let(:character1) { create :character, world: world }
    let(:character2) { create :character, world: world }
    let(:character3) { create :character, world: world }
    let(:location) { create :location, world: world }
    let!(:relationship1) do
      create :relationship, character: character1,
                            relatable: location, world: world
    end
    let!(:relationship2) do
      create :relationship, character: character2,
                            relatable: character1, world: world
    end
    let!(:relationship3) do
      create :relationship, character: character3,
                            relatable: location, world: world
    end
    let!(:relationship4) do
      create :relationship, character: character1,
                            relatable: character3, world: world
    end
    before do
      get :index, params: { relationship: relatable_params,
                            world_slug: world.slug }
    end
    subject { JSON.parse(response.body)['relationships'].map { |r| r['id'] } }

    context 'when relationships for character' do
      let(:relatable_params) do
        { relatable_id: character1.id, relatable_type: 'Character' }
      end

      it do
        expect(response).to have_http_status :success
        is_expected
          .to contain_exactly relationship1.id, relationship2.id,
                              relationship4.id
      end
    end

    context 'when relationships for location' do
      let(:relatable_params) do
        { relatable_id: location.id, relatable_type: 'Location' }
      end

      it do
        expect(response).to have_http_status :success
        is_expected.to contain_exactly relationship1.id, relationship3.id
      end
    end
  end

  describe 'POST #create' do
    let(:character) { create :character, world: world }
    let(:location) { create :location, world: world }
    let(:create_params) do
      { relationship: {
        character_id: character.id,
        name: relationship_name,
        relatable_id: location.id,
        relatable_type: location.class.to_s
      },
        world_slug: world.slug }
    end
    before { post :create, params: create_params }

    it do
      expect(response).to have_http_status :success
      expect(JSON.parse(response.body)['name']).to eq relationship_name
    end

    context 'when error' do
      let(:create_params) do
        { relationship: {
          character_id: character.id,
          relatable_id: location.id,
          relatable_type: location.class.to_s
        },
          world_slug: world.slug }
      end

      it do
        expect(response).to have_http_status :bad_request
        expect(JSON.parse(response.body)['error']).to be_present
      end
    end
  end

  describe 'PATCH #update' do
    let(:relationship) { create :relationship, world: world }
    let(:update_params) do
      { id: relationship.id,
        relationship: { name: relationship_name },
        world_slug: world.slug }
    end
    before { patch :update, params: update_params }

    it do
      expect(response).to have_http_status :success
      expect(JSON.parse(response.body)['name']).to eq relationship_name
      expect(relationship.reload.name).to eq relationship_name
    end

    context 'when lacking permissions' do
      let(:reader) do
        reader = create :user
        create :world_permission, user: reader, world: world,
                                  permission: WorldPermission::PERMISSION_READ
        reader
      end
      before { login(reader) }

      it do
        expect { patch :update, params: update_params }
          .to raise_error an_instance_of(ActionController::RoutingError)
      end
    end
  end
end
