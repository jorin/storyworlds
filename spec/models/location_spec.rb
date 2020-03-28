# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Location, type: :model do
  context 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:creator) }
    it { is_expected.to validate_presence_of(:world) }

    it_behaves_like 'has optional timeline'
  end
end
