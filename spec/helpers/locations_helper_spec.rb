# frozen_string_literal: true

require 'rails_helper'

RSpec.describe LocationsHelper, type: :helper do
  describe '#location_show_props_json' do
    let(:location) { create :location }
    let(:user) { create :user }
    before do
      helper.instance_variable_set(:@location, location)
      helper.instance_variable_set(:@world, location.world)
      session[:user_id] = user.id
    end
    subject { JSON.parse(helper.location_show_props_json) }

    it { is_expected.to be_a Hash }
  end
end
