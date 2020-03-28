# frozen_string_literal: true

require 'rails_helper'

def current_user; end

RSpec.describe UsersHelper, type: :helper do
  describe '#users_index_props_json' do
    let(:user) { create :user }
    before { session[:user_id] = user.id }
    subject { JSON.parse(helper.users_index_props_json) }

    it { is_expected.to be_a Hash }
  end
end
