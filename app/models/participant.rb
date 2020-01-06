class Participant < ApplicationRecord
  belongs_to :character
  belongs_to :event

  validates :character, uniqueness: { scope: :event }
  validate :validate_character

  private

  def validate_character
    if character.starts.present? && character.starts > event.ends
      errors.add(:character, 'must start before event ends')
    end

    if character.ends.present? && character.ends < event.starts
      errors.add(:event, 'must start before character ends')
    end

    # check for any existing participation where events overlap
    # b/c either event does not start before the other ends,
    # making the character unavailable for another event
    if Participant.joins(:event)
                  .where.not(id: id)
                  .where.not(events: { id: event.id })
                  .where(character_id: character_id)
                  .where.not('events.ends <= ? or ? <= events.starts',
                             event.starts, event.ends)
                  .exists?
      errors.add(:character, 'is already occupied during event')
    end
  end
end
