# frozen_string_literal: true

require 'rails_helper'

RSpec.describe FilterByTags do
  describe '.filter_by_params' do
    let!(:tag1) { create :tag }
    let!(:tag2) { create :tag, world: world }
    let!(:character1) do
      character = create :character, world: world
      character.tags << tag1
      character
    end
    let!(:character2) do
      character = create :character, world: world
      character.tags << tag1
      character.tags << tag2
      character
    end
    let!(:character3) { create :character, world: world }
    let(:world) { tag1.world }
    subject do
      described_class.filter_by_params(world.characters,
                                       'Character',
                                       params)
                     .map(&:id)
    end

    context 'when filtering to include any tag' do
      let(:params) do
        { filter_tags_include: [tag1.id, tag2.id] }
      end

      it do
        is_expected.to contain_exactly(character1.id, character2.id)
      end
    end

    context 'when filtering to require all tags' do
      let(:params) do
        { filter_tags_and: 'true',
          filter_tags_include: [tag1.id, tag2.id] }
      end

      it do
        is_expected.to contain_exactly(character2.id)
      end
    end

    context 'when filtering to exclude a tag' do
      let(:params) do
        { filter_tags_exclude: [tag1.id] }
      end

      it do
        is_expected.to contain_exactly(character3.id)
      end
    end
  end
end
