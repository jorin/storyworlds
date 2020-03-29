# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorldsController, type: :controller do
  describe 'GET #index' do
    context 'when html' do
      before { get :index }

      it { expect(response).to have_http_status :success }
      it { expect(response).to render_template :index }
    end

    context 'when json' do
      let(:user) { create :user }
      let!(:created_world) { create :world, creator: user }
      let!(:open_world) { create :world, open: true }
      let!(:permitted_world) do
        world = create :world
        world.world_permissions
             .create user: user, permission: WorldPermission::PERMISSION_READ
        world
      end
      let!(:unpermitted_world) { create :world }
      subject { JSON.parse(response.body)['worlds'] }

      context 'when not logged in' do
        before { get :index, format: :json }

        it { expect(response).to have_http_status :success }
        it do
          is_expected
            .to contain_exactly hash_including('id' => open_world.id)
        end
      end

      context 'when logged in' do
        before do
          login(user)
          get :index, format: :json
        end

        it { expect(response).to have_http_status :success }
        it do
          is_expected
            .to contain_exactly hash_including('id' => open_world.id),
                                hash_including('id' => created_world.id),
                                hash_including('id' => permitted_world.id)
        end
      end
    end
  end

  describe 'GET #show' do
    let(:user) { create :user }
    let(:world) { create :world, creator: user }

    shared_examples 'show world' do
      it { expect(response).to have_http_status :success }
      it { expect(response).to render_template :show }
    end

    context 'when not logged in' do
      before { get :show, params: { slug: world.slug } }

      it 'renders public index to allow login + redirect' do
        expect(response).to render_template :index
      end

      context 'when open world' do
        let(:world) { create :world, open: true }

        it_behaves_like 'show world'
      end
    end

    context 'when logged in' do
      before { login(user) }

      context 'when can view' do
        before { get :show, params: { slug: world.slug } }

        it_behaves_like 'show world'

        context 'when has permission' do
          let(:world) do
            world = create :world
            world.world_permissions
                 .create user: user,
                         permission: WorldPermission::PERMISSION_READ
            world
          end

          it_behaves_like 'show world'
        end
      end

      context 'when cannot view' do
        let(:world) { create :world }

        it do
          expect { get :show, params: { slug: world.slug } }
            .to raise_error an_instance_of(ActionController::RoutingError)
        end
      end
    end
  end

  shared_examples 'renders world' do
    it { expect(response).to have_http_status :success }
    it do
      expect(JSON.parse(response.body))
        .to eq JSON.parse(World.find(world.id)
                               .attributes
                               .to_camelback_keys.to_json)
    end
  end

  shared_examples 'renders error' do
    it { expect(response).to have_http_status :bad_request }
    it { expect(JSON.parse(response.body)['error']).to be_present }
  end

  describe 'POST #create' do
    it 'raises not found when not logged in' do
      expect { post :create, format: :json }
        .to raise_error an_instance_of(ActionController::RoutingError)
    end

    context 'when logged in' do
      let(:user) { create :user }
      let(:world) { assigns(:world) }
      let(:create_params) { { name: Faker::Lorem.word } }
      before do
        login(user)
        post :create, params: { world: create_params }, format: :json
      end

      context 'when valid params' do
        let(:create_params) { attributes_for :world }

        it_behaves_like 'renders world'
      end

      context 'when invalid params' do
        it_behaves_like 'renders error'
      end
    end
  end

  describe 'PATCH #update' do
    let(:user) { create :user }
    let(:world) { create :world }
    let(:update_params) do
      { slug: world.slug, world: { name: Faker::Lorem.word } }
    end

    shared_examples 'disallowed update' do
      it do
        expect { post :update, format: :json, params: update_params }
          .to raise_error an_instance_of(ActionController::RoutingError)
      end
    end

    context 'when disallowed updates' do
      context 'when not logged in' do
        it_behaves_like 'disallowed update'
      end

      context 'when logged in' do
        before { login(user) }

        it_behaves_like 'disallowed update'

        context 'when having permissions but not manager' do
          before do
            world.world_permissions
                 .create user: user,
                         permission: WorldPermission::PERMISSION_WRITE
          end

          it_behaves_like 'disallowed update'
        end
      end
    end

    context 'when logged in' do
      let(:world) { create :world, creator: user }
      before do
        login(user)
        post :update, params: update_params, format: :json
      end

      context 'when valid params' do
        it_behaves_like 'renders world'
      end

      context 'when invalid params' do
        let(:update_params) { { slug: world.slug, world: { name: '' } } }

        it_behaves_like 'renders error'
      end
    end
  end
end
