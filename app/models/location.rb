# frozen_string_literal: true

class Location < ApplicationRecord
  belongs_to :creator, class_name: :User
  belongs_to :world, inverse_of: :locations
  has_many :events, dependent: :destroy, inverse_of: :location
  has_many :relations, as: :relatable, dependent: :destroy,
                       class_name: :Relationship
  has_many :taggings, as: :tagged, dependent: :destroy
  has_many :tags, through: :taggings

  accepts_nested_attributes_for :taggings, allow_destroy: true

  validates :name, presence: true
  validates_presence_of :creator
  validates_presence_of :world
  validate :validate_starts_ends

  has_ancestry
  html_fragment :description, scrub: :strip

  def to_full_h
    attributes
      .merge(ancestors: ancestors_attributes,
             contains: contains_attributes,
             parent: ancestors_attributes.last,
             taggings: taggings_attributes)
  end

  private

  def ancestors_attributes
    @ancestors_attributes ||= ancestors.select(:id, :name).map(&:attributes)
  end

  def contains_attributes
    descendants.select(:id, :ancestry, :coordinate_x, :coordinate_y, :name)
               .map(&:attributes)
  end

  def taggings_attributes
    taggings.map do |tagging|
      tagging.attributes
             .merge(tag: tagging.tag.attributes)
    end
  end

  def validate_starts_ends
    return unless starts.present? && ends.present? && starts > ends

    errors.add(:starts, 'must precede ends')
  end
end
