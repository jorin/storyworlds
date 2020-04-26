# frozen_string_literal: true

class Tagging < ApplicationRecord
  belongs_to :tag, inverse_of: :taggings
  belongs_to :tagged, polymorphic: true

  validates :tag, presence: true,
                  uniqueness: { scope: %i[tagged_id tagged_type] }
  validates :tagged, presence: true
end
