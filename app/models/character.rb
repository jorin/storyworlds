# frozen_string_literal: true

class Character < ApplicationRecord
  belongs_to :creator, class_name: :User
  belongs_to :world, inverse_of: :characters
  has_many :participants
  has_many :events, through: :participants
  has_many :relationships, dependent: :destroy
  has_many :relations, as: :relatable, dependent: :destroy,
                       class_name: :Relationship
  has_many :taggings, as: :tagged, dependent: :destroy
  has_many :tags, through: :taggings

  accepts_nested_attributes_for :relationships, allow_destroy: true
  accepts_nested_attributes_for :taggings, allow_destroy: true

  validates :name, presence: true
  validates_presence_of :creator
  validates_presence_of :world
  validate :validate_starts_ends

  html_fragment :description, scrub: :strip

  def to_full_h
    attributes
      .merge(taggings: taggings.map do |tagging|
                         tagging.attributes
                                .merge(tag: tagging.tag.attributes)
                       end)
  end

  private

  def error_ends_before_last_event
    end_after = events.maximum(:starts)
    if ends.present? &&
       end_after.present? &&
       ends < end_after
      errors.add(:ends, 'must end after start of last related event')
    end
  end

  def error_starts_after_first_event
    start_before = events.minimum(:ends)
    if starts.present? &&
       start_before.present? &&
       starts > start_before
      errors.add(:starts, 'must start before end of first related event')
    end
  end

  def error_starts_before_ends
    return unless starts.present? && ends.present? && starts > ends

    errors.add(:starts, 'must precede ends')
  end

  def validate_starts_ends
    error_starts_before_ends
    error_starts_after_first_event
    error_ends_before_last_event
  end
end
