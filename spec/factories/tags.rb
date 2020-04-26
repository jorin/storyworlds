# frozen_string_literal: true

FactoryBot.define do
  factory :tag do
    name { Faker::Lorem.word }
    slug { Faker::Internet.slug(glue: '-') }
    world
  end
end
