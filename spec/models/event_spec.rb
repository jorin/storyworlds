# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Event, type: :model do
  context 'validations' do
    subject { build :event }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:creator) }
    it { is_expected.to validate_presence_of(:location) }
    it { is_expected.to validate_presence_of(:world) }

    context 'validating starts and ends' do
      it { is_expected.to be_valid }

      context 'when starts equals ends' do
        subject { build :event, starts: 500, ends: 500 }

        it { is_expected.to be_valid }
      end

      context 'when starts after ends' do
        subject { build :event, starts: 1500, ends: 500 }

        it { is_expected.to_not be_valid }
      end
    end

    context 'validating location timeline' do
      let(:starts) { 500 }
      let(:ends) { 1500 }
      let(:location) { create :location, starts: 450, ends: 1600 }
      subject { build :event, location: location, starts: starts, ends: ends }

      it { is_expected.to be_valid }

      context 'when starting after location ends' do
        let(:starts) { 1650 }
        let(:ends) { 1800 }

        it { is_expected.to_not be_valid }
      end

      context 'when ending before location starts' do
        let(:starts) { 200 }
        let(:ends) { 375 }

        it { is_expected.to_not be_valid }
      end
    end
  end

  describe '#to_full_event_h' do
    let(:world) { create :world }
    let(:location) { create :location, world: world }
    let(:characters) { create_list :character, 3, world: world }
    let(:tags) { create_list :tag, 2, world: world }
    let(:event) do
      create :event, location: location, world: world,
                     characters: characters, tags: tags
    end
    let(:full_event_h) do
      participants = event.participants
                          .map do |p|
                            p.attributes
                             .merge(character: p.character.attributes)
                          end
      taggings = event.taggings
                      .map do |t|
                        t.attributes
                         .merge(tag: t.tag.attributes)
                      end
      event.attributes.merge(location: location.attributes,
                             participants: participants,
                             taggings: taggings)
    end
    subject { event.to_full_event_h }

    it { is_expected.to eq full_event_h }
  end
end
