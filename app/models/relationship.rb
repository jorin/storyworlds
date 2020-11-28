# frozen_string_literal: true

class Relationship < ApplicationRecord
  belongs_to :creator, class_name: :User
  belongs_to :world, inverse_of: :relationships
  belongs_to :character
  belongs_to :relatable, polymorphic: true

  validates :name, presence: true
  validates_presence_of :creator
  validates_presence_of :character
  validates_presence_of :relatable
  validates_presence_of :world
  validate :validate_ends, if: lambda {
    ends? && (character.ends? || relatable.ends?)
  }
  validate :validate_starts, if: lambda {
    starts? && (character.starts? || relatable.starts?)
  }

  html_fragment :description, scrub: :strip

  private

  def validate_ends
    validate_ends_character
    validate_ends_relatable
  end

  def validate_ends_character
    return unless relatable.ends? && ends > relatable.ends

    errors.add(:ends,
               "must be before #{relatable.class} #{relatable.id} end")
  end

  def validate_ends_relatable
    return unless character.ends? && ends > character.ends

    errors.add(:ends,
               "must be before Character #{character.id} end")
  end

  def validate_starts
    validate_starts_character
    validate_starts_relatable
  end

  def validate_starts_character
    return unless relatable.starts? && starts < relatable.starts

    errors.add(:starts,
               "must be after #{relatable.class} #{relatable.id} start")
  end

  def validate_starts_relatable
    return unless character.starts? && starts < character.starts

    errors.add(:starts,
               "must be after Character #{character.id} start")
  end
end
