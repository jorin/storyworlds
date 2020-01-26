class World < ApplicationRecord
  belongs_to :creator, class_name: :User
  has_many :characters, dependent: :destroy, inverse_of: :world
  has_many :events, dependent: :destroy, inverse_of: :world
  has_many :locations, dependent: :destroy, inverse_of: :world
  has_many :world_permissions, dependent: :destroy, inverse_of: :world

  accepts_nested_attributes_for :world_permissions, allow_destroy: true

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: true

  html_fragment :description, scrub: :strip

  def can_manage?(user_id)
    user_id == creator_id
  end

  def can_read?(user_id)
    can_manage?(user_id) ||
      open? ||
      world_permissions.exists?(user_id: user_id)
  end

  def can_write?(user_id)
    can_manage?(user_id) ||
      world_permissions.exists?(permission: WorldPermission::PERMISSION_WRITE,
                                user_id: user_id)
  end
end
