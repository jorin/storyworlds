# frozen_string_literal: true

FactoryBot.define do
  factory :location do
    name { Faker::Address.city }
    world
    association :creator, factory: :user
  end
end
