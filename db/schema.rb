# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_11_28_194453) do

  create_table "characters", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.bigint "creator_id"
    t.bigint "world_id", null: false
    t.bigint "starts"
    t.bigint "ends"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["creator_id"], name: "index_characters_on_creator_id"
    t.index ["world_id"], name: "index_characters_on_world_id"
  end

  create_table "events", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.bigint "creator_id"
    t.bigint "location_id", null: false
    t.bigint "world_id", null: false
    t.bigint "starts"
    t.bigint "ends"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["creator_id"], name: "index_events_on_creator_id"
    t.index ["location_id"], name: "index_events_on_location_id"
    t.index ["world_id"], name: "index_events_on_world_id"
  end

  create_table "locations", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.bigint "creator_id"
    t.bigint "world_id", null: false
    t.bigint "starts"
    t.bigint "ends"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.string "ancestry"
    t.float "coordinate_x"
    t.float "coordinate_y"
    t.index ["ancestry"], name: "index_locations_on_ancestry"
    t.index ["creator_id"], name: "index_locations_on_creator_id"
    t.index ["world_id"], name: "index_locations_on_world_id"
  end

  create_table "participants", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "character_id"
    t.bigint "event_id"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["character_id"], name: "index_participants_on_character_id"
    t.index ["event_id"], name: "index_participants_on_event_id"
  end

  create_table "relationships", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name"
    t.string "inverse_name"
    t.text "description"
    t.bigint "character_id", null: false
    t.string "relatable_type", null: false
    t.bigint "relatable_id", null: false
    t.bigint "creator_id"
    t.bigint "world_id", null: false
    t.bigint "starts"
    t.bigint "ends"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["character_id"], name: "index_relationships_on_character_id"
    t.index ["creator_id"], name: "index_relationships_on_creator_id"
    t.index ["relatable_type", "relatable_id"], name: "index_relationships_on_relatable_type_and_relatable_id"
    t.index ["world_id"], name: "index_relationships_on_world_id"
  end

  create_table "taggings", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.bigint "tag_id", null: false
    t.string "tagged_type", null: false
    t.bigint "tagged_id", null: false
    t.index ["tag_id"], name: "index_taggings_on_tag_id"
    t.index ["tagged_type", "tagged_id"], name: "index_taggings_on_tagged_type_and_tagged_id"
  end

  create_table "tags", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name"
    t.string "slug", null: false
    t.bigint "world_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["world_id"], name: "index_tags_on_world_id"
  end

  create_table "users", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "email"
    t.string "password_digest"
    t.string "first_name"
    t.string "last_name"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["email"], name: "index_users_on_email", unique: true
  end

  create_table "world_permissions", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "permission", null: false
    t.bigint "user_id", null: false
    t.bigint "world_id", null: false
    t.index ["user_id"], name: "index_world_permissions_on_user_id"
    t.index ["world_id"], name: "index_world_permissions_on_world_id"
  end

  create_table "worlds", options: "ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci", force: :cascade do |t|
    t.string "name"
    t.string "slug", null: false
    t.text "description"
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.bigint "creator_id"
    t.boolean "open"
    t.string "timeline_units"
    t.index ["creator_id"], name: "index_worlds_on_creator_id"
    t.index ["slug"], name: "index_worlds_on_slug", unique: true
  end

  add_foreign_key "characters", "users", column: "creator_id"
  add_foreign_key "characters", "worlds"
  add_foreign_key "events", "locations"
  add_foreign_key "events", "users", column: "creator_id"
  add_foreign_key "events", "worlds"
  add_foreign_key "locations", "users", column: "creator_id"
  add_foreign_key "locations", "worlds"
  add_foreign_key "relationships", "characters"
  add_foreign_key "relationships", "users", column: "creator_id"
  add_foreign_key "relationships", "worlds"
  add_foreign_key "taggings", "tags"
  add_foreign_key "tags", "worlds"
  add_foreign_key "world_permissions", "users"
  add_foreign_key "world_permissions", "worlds"
  add_foreign_key "worlds", "users", column: "creator_id"
end
