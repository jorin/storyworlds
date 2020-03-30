# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UsersController, type: :controller do
  describe 'GET #index' do
    context 'when not logged in' do
      it do
        expect { get :index }
          .to raise_error an_instance_of(ActionController::RoutingError)
      end
    end

    context 'when logged in' do
      before do
        login
        get :index
      end

      it { expect(response).to have_http_status :success }
      it { expect(response).to render_template :index }
    end
  end

  describe 'PATCH #update' do
    let(:user) { create :user }
    let(:first_name) { Faker::Name.first_name }
    let(:update_params) do
      { first_name: first_name,
        id: user.id }
    end

    context 'when not logged in' do
      it do
        expect { patch :update, params: update_params }
          .to raise_error an_instance_of(ActionController::RoutingError)
      end
    end

    context 'when logged in' do
      context 'when updating self' do
        before do
          login(user)
          patch :update, params: update_params
        end

        it { expect(response).to have_http_status :success }
        it { expect(user.reload.first_name).to eq first_name }

        context 'when invalid update' do
          let(:update_params) { { first_name: nil, id: user.id } }

          it { expect(response).to have_http_status :bad_request }
          it { expect(JSON.parse(response.body)['error']).to be_present }
        end
      end

      context 'when trying to update a different user' do
        before { login }

        it do
          expect { patch :update, params: update_params }
            .to raise_error an_instance_of(ActionController::BadRequest)
        end
      end
    end
  end
end
