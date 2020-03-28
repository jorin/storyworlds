# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Participant, type: :model do
  context 'validations' do
    it { is_expected.to validate_presence_of(:character) }
    it { is_expected.to validate_presence_of(:event) }
    it do
      is_expected
        .to validate_uniqueness_of(:character_id).scoped_to(:event_id)
    end

    context 'when validating character timelines' do
      let(:location) { create :location }
      let(:world) { location.world }
      let(:character) { create :character, world: world }
      let(:event_starts) { 1200 }
      let(:event) do
        create :event, location: location, world: world,
                       starts: event_starts, ends: 1500
      end
      subject { described_class.new character: character, event: event }

      context 'when validating availability' do
        before do
          create :event, location: location, world: world,
                         starts: 500, ends: 1000,
                         characters: [character]
        end
        it { is_expected.to be_valid }

        context 'when already busy' do
          let(:event_starts) { 900 }

          it { is_expected.to_not be_valid }
        end
      end

      context 'when character starts after event ends' do
        let(:character) { create :character, world: world, starts: 1700 }

        it { is_expected.to_not be_valid }
      end

      context 'when character ends before event starts' do
        let(:character) { create :character, world: world, ends: 900 }

        it { is_expected.to_not be_valid }
      end
    end
  end
end
