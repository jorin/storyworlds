# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Relationship, type: :model do
  context 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:character) }
    it { is_expected.to validate_presence_of(:creator) }
    it { is_expected.to validate_presence_of(:relatable) }
    it { is_expected.to validate_presence_of(:world) }

    context 'when validating timeline' do
      let(:character) { create :character, ends: 250, starts: 10 }
      let(:ends) { nil }
      let(:location) { create :location, world: world, ends: 300, starts: 120 }
      let(:starts) { nil }
      let(:world) { character.world }
      subject do
        build :relationship, character: character, ends: ends,
                             relatable: location, starts: starts, world: world
      end

      context 'when no relationship timeline' do
        it { is_expected.to be_valid }
      end

      context 'when relationship timeline falls within related entities' do
        let(:ends) { 200 }
        let(:starts) { 150 }

        it { is_expected.to be_valid }
      end

      context 'when relationship precedes related entities' do
        let(:starts) { 5 }

        it { is_expected.not_to be_valid }
      end

      context 'when relationship outlasts related entities' do
        let(:ends) { 500 }

        it { is_expected.not_to be_valid }
      end

      context 'when relationship excedes mutual entity timeline' do
        let(:ends) { 280 }
        let(:starts) { 90 }

        it { is_expected.not_to be_valid }
      end
    end
  end
end
