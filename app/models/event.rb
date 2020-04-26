# frozen_string_literal: true

class Event < ApplicationRecord
  belongs_to :creator, class_name: :User
  belongs_to :location, inverse_of: :events
  belongs_to :world, inverse_of: :events
  has_many :participants
  has_many :characters, through: :participants
  has_many :taggings, as: :tagged, dependent: :destroy
  has_many :tags, through: :taggings

  accepts_nested_attributes_for :participants, allow_destroy: true
  accepts_nested_attributes_for :taggings, allow_destroy: true

  validates :name, presence: true
  validates :ends, presence: true,
                   numericality: { greater_than_or_equal_to: :starts }
  validates :starts, presence: true
  validates_presence_of :creator
  validates_presence_of :location
  validates_presence_of :world
  validate :validate_location_timeline

  html_fragment :description, scrub: :strip

  def to_full_event_h
    attributes.merge(location: location.attributes,
                     participants: participants_attributes,
                     taggings: taggings_attributes)
  end

  private

  def error_ends_after_location
    if location&.ends? &&
       (starts > location.ends || ends > location.ends)
      errors.add(:ends, 'must be within location timeline')
    end
  end

  def error_starts_before_location
    if location&.starts? &&
       (starts < location.starts || ends < location.starts)
      errors.add(:starts, 'must be within location timeline')
    end
  end

  def participants_attributes
    participants
      .map { |p| p.attributes.merge(character: p.character.attributes) }
  end

  def taggings_attributes
    taggings
      .map { |t| t.attributes.merge(tag: t.tag.attributes) }
  end

  def validate_location_timeline
    error_starts_before_location
    error_ends_after_location
  end
end
