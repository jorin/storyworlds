# frozen_string_literal: true

require 'rails_helper'

def current_user; end

RSpec.describe ApplicationHelper, type: :helper do
  describe '.header_props_json' do
    let(:user) { create :user }
    let(:world) { create :world, creator: user }
    before do
      allow(helper).to receive(:current_user).and_return(user)
      helper.instance_variable_set(:@world, world)
    end
    subject { JSON.parse(helper.header_props_json) }

    it { is_expected.to be_a Hash }

    context 'when viewing a world user didnt create' do
      let(:world) { create :world }
      before { create :world_permission, user: user, world: world }

      it { is_expected.to be_a Hash }
    end
  end
end
