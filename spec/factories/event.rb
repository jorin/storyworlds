# frozen_string_literal: true

FactoryBot.define do
  factory :event do
    name { Faker::Marketing.buzzwords }
    starts { rand(1..1000) }
    ends { rand(1001..2000) }
    world
    location
    association :creator, factory: :user
  end
end
