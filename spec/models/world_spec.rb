# frozen_string_literal: true

require 'rails_helper'

RSpec.describe World, type: :model do
  context 'validations' do
    subject { build :world }

    it { is_expected.to validate_presence_of(:name) }
    it { is_expected.to validate_presence_of(:slug) }
    it { is_expected.to validate_uniqueness_of(:slug).case_insensitive }
    it { is_expected.to validate_presence_of(:creator) }
  end

  context 'permissions' do
    let(:world) { create :world }
    let(:creator) { world.creator }
    let(:writer) do
      writer = create :user
      create :world_permission, user: writer, world: world,
                                permission: WorldPermission::PERMISSION_WRITE
      writer
    end
    let(:reader) do
      reader = create :user
      create :world_permission, user: reader, world: world,
                                permission: WorldPermission::PERMISSION_READ
      reader
    end
    let(:anon) { create :user }

    describe '#can_manage?' do
      it { expect(world.can_manage?(creator.id)).to be true }
      it { expect(world.can_manage?(writer.id)).to be false }
      it { expect(world.can_manage?(reader.id)).to be false }
      it { expect(world.can_manage?(anon.id)).to be false }
    end

    describe '#can_write?' do
      it { expect(world.can_write?(creator.id)).to be true }
      it { expect(world.can_write?(writer.id)).to be true }
      it { expect(world.can_write?(reader.id)).to be false }
      it { expect(world.can_write?(anon.id)).to be false }
    end

    describe '#can_read?' do
      it { expect(world.can_read?(creator.id)).to be true }
      it { expect(world.can_read?(writer.id)).to be true }
      it { expect(world.can_read?(reader.id)).to be true }
      it { expect(world.can_read?(anon.id)).to be false }

      context 'when open world' do
        let(:world) { create :world, open: true }

        it { expect(world.can_read?(creator.id)).to be true }
        it { expect(world.can_read?(writer.id)).to be true }
        it { expect(world.can_read?(reader.id)).to be true }
        it { expect(world.can_read?(anon.id)).to be true }
      end
    end
  end
end
