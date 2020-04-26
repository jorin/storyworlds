# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Tag, type: :model do
  context 'validations' do
    subject { build :tag }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:slug) }
    it { is_expected.to validate_uniqueness_of(:slug).scoped_to(:world_id) }
    it { is_expected.to validate_presence_of(:world) }
  end
end
