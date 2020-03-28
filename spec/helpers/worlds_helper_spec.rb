# frozen_string_literal: true

require 'rails_helper'

def current_user; end

RSpec.describe WorldsHelper, type: :helper do
  let(:user) { create :user }
  let(:world) { create :world, creator: user }
  before { helper.instance_variable_set(:@world, world) }

  describe '#world_show_props_json' do
    before { session[:user_id] = user.id }
    subject { JSON.parse(helper.world_show_props_json) }

    it { is_expected.to be_a Hash }
  end

  describe '#worlds_index_props_json' do
    subject { JSON.parse(helper.worlds_index_props_json) }

    it { is_expected.to be_a Hash }
    it { is_expected.to_not have_key 'createProps' }

    context 'when a user is logged in' do
      before do
        create :world_permission, user: user
        allow(helper).to receive(:current_user).and_return(user)
      end

      it { is_expected.to have_key 'createProps' }
    end
  end
end
