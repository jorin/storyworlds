# frozen_string_literal: true

class Participant < ApplicationRecord
  belongs_to :character
  belongs_to :event

  scope :other_participants_of_character, lambda { |participant|
    joins(:event)
      .where.not(id: participant.id)
      .where.not(events: { id: participant.event_id })
      .where(character_id: participant.character_id)
  }

  validates :character, uniqueness: { scope: :event }
  validate :validate_character

  private

  # check for any existing participation where events overlap
  # b/c either event does not start before the other ends,
  # making the character unavailable for another event
  def error_character_not_available
    if Participant.other_participants_of_character(self)
                  .where.not('events.ends <= ? or ? <= events.starts',
                             event.starts, event.ends)
                  .exists?
      errors.add(:character, 'is already occupied during event')
    end
  end

  def error_character_starts_after_event_ends
    if character.starts.present? &&
       character.starts > event.ends
      errors.add(:character, 'must start before event ends')
    end
  end

  def error_event_starts_after_character_ends
    if character.ends.present? &&
       character.ends < event.starts
      errors.add(:event, 'must start before character ends')
    end
  end

  def validate_character
    error_character_starts_after_event_ends
    error_event_starts_after_character_ends
    error_character_not_available
  end
end
