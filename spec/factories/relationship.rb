# frozen_string_literal: true

FactoryBot.define do
  factory :relationship do
    name { Faker::Relationship.familial }
    character
    world
    association :creator, factory: :user
    association :relatable, factory: :character
  end
end
