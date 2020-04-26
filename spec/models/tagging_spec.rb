# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Tagging, type: :model do
  context 'validations' do
    let(:tag) { create :tag }
    let(:character) do
      character = create :character, world: tag.world
      character.tags << tag
      character
    end
    subject { character.taggings.first }

    it { is_expected.to validate_presence_of :tag }
    it { is_expected.to validate_presence_of :tagged }

    it 'validates uniqueness of tag per tagged entity' do
      expect { character.tags << tag }
        .to raise_error an_instance_of(ActiveRecord::RecordInvalid)
    end
  end
end
