# frozen_string_literal: true

require 'rails_helper'

RSpec.describe SessionsController, type: :controller do
  shared_examples 'redirects' do
    it { expect(response).to redirect_to root_url }
  end

  shared_examples 'redirects with no user' do
    it_behaves_like 'redirects'
    it { expect(session[:user_id]).to be nil }
  end

  describe 'GET #create' do
    let(:user) { create :user }
    let(:password) { user.password }
    before do
      request.env['HTTP_REFERER'] = root_url
      post :create, params: { email: user.email, password: password }
    end
    
    context 'when valid login' do
      it_behaves_like 'redirects'
      it { expect(session[:user_id]).to eq user.id }
    end

    context 'when invalid login' do
      let(:password) { "#{user.password}Invalid" }

      it_behaves_like 'redirects with no user'
    end
  end

  describe 'GET #destroy' do
    before do
      login
      delete :destroy
    end

    it_behaves_like 'redirects with no user'
  end
end
