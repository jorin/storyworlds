# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Location, type: :model do
  context 'validations' do
    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:creator) }
    it { is_expected.to validate_presence_of(:world) }

    it_behaves_like 'has optional timeline'
  end

  describe '#to_full_h' do
    let(:world) { create :world }
    let(:tags) { create_list :tag, 2, world: world }
    let(:location) { create :location, tags: tags, world: world }
    subject { location.to_full_h }

    it do
      is_expected
        .to eq location.attributes
                       .merge(taggings: location.taggings
                                                .map do |t|
                                          t.attributes
                                           .merge(tag: t.tag.attributes)
                                        end)
    end
  end
end
