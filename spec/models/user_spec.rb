# frozen_string_literal: true

require 'rails_helper'

RSpec.describe User, type: :model do
  context 'validations' do
    it { is_expected.to validate_presence_of(:email) }
    it { is_expected.to validate_uniqueness_of(:email) }
    it { is_expected.to validate_presence_of(:first_name) }
    it { is_expected.to validate_presence_of(:last_name) }
  end

  describe '#world_permission' do
    let(:user) { create :user }
    let(:world) { create :world }
    subject { user.world_permission(world) }

    context 'when creator' do
      let(:world) { create :world, creator: user }

      it { is_expected.to eq WorldPermission::PERMISSION_MANAGE }
    end

    context 'when writer' do
      before do
        create :world_permission, user: user, world: world,
                                  permission: WorldPermission::PERMISSION_WRITE
      end

      it { is_expected.to eq WorldPermission::PERMISSION_WRITE }
    end

    context 'when reader' do
      before do
        create :world_permission, user: user, world: world,
                                  permission: WorldPermission::PERMISSION_READ
      end

      it { is_expected.to eq WorldPermission::PERMISSION_READ }
    end

    context 'when no permissions' do
      it { is_expected.to be nil }
    end
  end
end
