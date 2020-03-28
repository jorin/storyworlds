# frozen_string_literal: true

FactoryBot.define do
  factory :world do
    name { Faker::Lorem.word }
    slug { Faker::Internet.slug(glue: '-') }
    association :creator, factory: :user
  end
end
