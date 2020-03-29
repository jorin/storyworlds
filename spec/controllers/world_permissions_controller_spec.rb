# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorldPermissionsController, type: :controller do
  let(:user) { create :user }
  let(:world) { create :world, creator: user }
  let(:contributor) do
    contributor = create :user
    world.world_permissions
         .create user_id: contributor.id,
                 permission: WorldPermission::PERMISSION_WRITE
    contributor
  end
  let(:permission) { WorldPermission::PERMISSION_READ }

  describe 'POST #create' do
    let(:params) do
      { world_slug: world.slug,
        permission: permission,
        email: create(:user).email }
    end

    shared_examples 'not found' do
      it do
        expect { post :create, params: params }
          .to raise_error an_instance_of(ActionController::RoutingError)
      end
    end

    it_behaves_like 'not found'

    context 'when not a world user' do
      before { login }

      it_behaves_like 'not found'
    end

    context 'when not a world manager' do
      before { login(contributor) }

      it_behaves_like 'not found'
    end

    context 'when manager' do
      let(:reader) { create :user }
      before do
        login(user)
        post :create, params: { world_slug: world.slug,
                                permission: permission,
                                email: [contributor, reader].map(&:email) }
      end

      it { expect(response).to have_http_status :success }
      it do
        expect(JSON.parse(response.body))
          .to contain_exactly hash_including('email' => reader.email,
                                             'permission' => permission),
                              hash_including('email' => contributor.email,
                                             'permission' => permission)
      end
    end
  end

  shared_examples 'renders error' do
    it { expect(response).to have_http_status :bad_request }
    it { expect(JSON.parse(response.body)['error']).to be_present }
  end

  describe 'PATCH #update' do
    let(:world_permission) do
      world.world_permissions.find_by(user_id: contributor.id)
    end
    let(:update_params) do
      { id: world_permission.id,
        world_slug: world.slug,
        world_permission: { permission: permission } }
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
        before { login }

        it_behaves_like 'disallowed update'

        context 'when having permissions but not manager' do
          before { login(contributor) }

          it_behaves_like 'disallowed update'
        end
      end
    end

    context 'when logged in' do
      before do
        login(user)
        post :update, params: update_params, format: :json
      end

      context 'when valid params' do
        it { expect(response).to have_http_status :success }
        it do
          expect(JSON.parse(response.body))
            .to eq JSON.parse(WorldPermission.find(world_permission.id)
                                             .attributes
                                             .to_camelback_keys.to_json)
        end
      end

      context 'when invalid params' do
        let(:permission) { 'Invalid Permission Type' }

        it_behaves_like 'renders error'
      end
    end
  end

  describe 'DELETE #destroy' do
    let(:world_permission) do
      world.world_permissions.find_by(user_id: contributor.id)
    end
    let(:destroy_params) do
      { id: world_permission.id,
        world_slug: world.slug }
    end

    shared_examples 'disallowed destroy' do
      it do
        expect { delete :destroy, format: :json, params: destroy_params }
          .to raise_error an_instance_of(ActionController::RoutingError)
      end
    end

    context 'when disallowed destroys' do
      context 'when not logged in' do
        it_behaves_like 'disallowed destroy'
      end

      context 'when logged in' do
        before { login }

        it_behaves_like 'disallowed destroy'

        context 'when having permissions but not manager' do
          before { login(contributor) }

          it_behaves_like 'disallowed destroy'
        end
      end
    end

    context 'when logged in' do
      before do
        login(user)
        delete :destroy, params: destroy_params, format: :json
      end

      it { expect(response).to have_http_status :success }
      it do
        expect(JSON.parse(response.body))
          .to include('id' => world_permission.id)
      end
      it { expect(WorldPermission.find_by(id: world_permission.id)).to be nil }
    end
  end
end
