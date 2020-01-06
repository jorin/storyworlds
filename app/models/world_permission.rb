class WorldPermission < ApplicationRecord
  PERMISSION_MANAGE = 'manage'
  PERMISSION_READ = 'read'
  PERMISSION_WRITE = 'write'
  PERMISSIONS = [PERMISSION_READ, PERMISSION_WRITE].freeze

  belongs_to :user, inverse_of: :world_permissions
  belongs_to :world, inverse_of: :world_permissions

  validates :permission, inclusion: PERMISSIONS
  validates :user, uniqueness: { scope: :world }
  validates_presence_of :user
  validates_presence_of :world

  def to_contributor_h
    {
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      permission: permission,
      permission_id: id
    }
  end
end
