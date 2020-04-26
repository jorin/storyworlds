# frozen_string_literal: true

class Tag < ApplicationRecord
  belongs_to :world, inverse_of: :tags
  has_many :taggings, dependent: :destroy, inverse_of: :tag
  has_many :characters, through: :taggings,
                        source: :tagged, source_type: 'Character'
  has_many :events, through: :taggings, source: :tagged, source_type: 'Event'
  has_many :locations, through: :taggings,
                       source: :tagged, source_type: 'Location'

  validates :name, presence: true
  validates :slug, presence: true, uniqueness: { scope: :world_id }
  validates_presence_of :world
end
