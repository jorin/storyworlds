# frozen_string_literal: true

FactoryBot.define do
  factory :world_permission do
    user
    world
    permission { WorldPermission::PERMISSIONS.sample }
  end
end
