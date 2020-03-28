# frozen_string_literal: true

RSpec.shared_examples 'has optional timeline' do
  let(:starts) { nil }
  let(:ends) { nil }
  subject do
    FactoryBot.build described_class.to_s.underscore.to_sym,
                     starts: starts, ends: ends
  end

  it { is_expected.to be_valid }

  context 'when starts' do
    let(:starts) { 1000 }

    it { is_expected.to be_valid }
  end

  context 'when ends' do
    let(:ends) { 1000 }

    it { is_expected.to be_valid }
  end

  context 'when starts before ends' do
    let(:starts) { 1000 }
    let(:ends) { 2000 }

    it { is_expected.to be_valid }
  end

  context 'when starts is ends' do
    let(:starts) { 1000 }
    let(:ends) { 1000 }

    it { is_expected.to be_valid }
  end

  context 'when starts after ends' do
    let(:starts) { 2000 }
    let(:ends) { 1000 }

    it { is_expected.to_not be_valid }
  end
end
