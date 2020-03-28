# frozen_string_literal: true

require 'rails_helper'

RSpec.describe CharactersHelper, type: :helper do
  describe '#character_show_props_json' do
    let(:character) { create :character }
    let(:user) { create :user }
    before do
      helper.instance_variable_set(:@character, character)
      helper.instance_variable_set(:@world, character.world)
      session[:user_id] = user.id
    end
    subject { JSON.parse(helper.character_show_props_json) }

    it { is_expected.to be_a Hash }
  end
end
