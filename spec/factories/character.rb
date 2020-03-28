# frozen_string_literal: true

FactoryBot.define do
  factory :character do
    name { Faker::FunnyName.two_word_name }
    world
    association :creator, factory: :user
  end
end
