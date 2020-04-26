# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Character, type: :model do
  context 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:creator) }
    it { is_expected.to validate_presence_of(:world) }

    it_behaves_like 'has optional timeline'

    context 'validating event timelines' do
      let(:location) { create :location }
      let(:world) { location.world }
      let(:character) do
        create :character, world: world,
                           starts: 500, ends: 1000
      end
      before do
        create :event, location: location, world: world,
                       characters: [character],
                       starts: 750, ends: 850
      end
      subject { character }

      it { is_expected.to be_valid }

      context 'when the character starts inside the event' do
        before { character.starts = 800 }

        it { is_expected.to be_valid }
      end

      context 'when the character starts after the event' do
        before { character.starts = 900 }

        it { is_expected.to_not be_valid }
      end

      context 'when the character ends inside the event' do
        before { character.ends = 800 }

        it { is_expected.to be_valid }
      end

      context 'when the character ends before the event' do
        before { character.ends = 600 }

        it { is_expected.to_not be_valid }
      end
    end
  end

  describe '#to_full_h' do
    let(:world) { create :world }
    let(:tags) { create_list :tag, 2, world: world }
    let(:character) { create :character, tags: tags, world: world }
    subject { character.to_full_h }

    it do
      is_expected
        .to eq character.attributes
                        .merge(taggings: character.taggings
                                                  .map do |t|
                                           t.attributes
                                            .merge(tag: t.tag.attributes)
                                         end)
    end
  end
end
