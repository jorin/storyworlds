class Location < ApplicationRecord
  belongs_to :creator, class_name: :User
  belongs_to :world, inverse_of: :locations
  has_many :events, dependent: :destroy, inverse_of: :location

  validates :name, presence: true
  validates_presence_of :creator
  validates_presence_of :world
  validate :validate_starts_ends

  html_fragment :description, scrub: :strip

  private

  def validate_starts_ends
    if starts.present? && ends.present? && starts > ends
      errors.add(:starts, 'must precede ends')
    end
  end
end
