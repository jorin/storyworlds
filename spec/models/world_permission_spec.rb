# frozen_string_literal: true

require 'rails_helper'

RSpec.describe WorldPermission, type: :model do
  context 'validations' do
    subject { build :world_permission }

    it { is_expected.to validate_presence_of(:user) }
    it { is_expected.to validate_uniqueness_of(:user_id).scoped_to(:world_id) }
    it { is_expected.to validate_presence_of(:world) }
    it do
      is_expected
        .to validate_inclusion_of(:permission)
        .in_array(described_class::PERMISSIONS)
    end
  end

  describe '#to_contributor_h' do
    let(:permission) { create :world_permission }
    let(:user) { permission.user }
    subject { permission.to_contributor_h }

    it do
      is_expected.to eq(email: user.email,
                        first_name: user.first_name,
                        last_name: user.last_name,
                        permission: permission.permission,
                        permission_id: permission.id)
    end
  end
end
