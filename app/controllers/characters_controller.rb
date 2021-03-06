# frozen_string_literal: true

class CharactersController < ByWorldController
  before_action :character, only: %i[show]
  before_action :permit_character_update, only: %i[update]
  before_action :permit_read, only: %i[index show]
  before_action :permit_write, only: %i[create]

  def index
    render json: { characters: page(characters).map(&:to_full_h),
                   total: characters.size }.to_camelback_keys
  end

  def create
    @character = world.characters
                      .create(character_params.merge(creator: current_user))
    render_for_character(character.persisted?)
  end

  def update
    render_for_character(character.update(character_params))
  end

  private

  def character
    @character ||= world&.characters&.find_by(id: params[:id])
  end

  def character_params
    character_params = params.require(:character)
                             .permit(:id, :description, :ends, :name, :starts,
                                     taggings: [:id, :_destroy,
                                                tag: %i[id name slug]])
    format_tag_params!(character_params)
  end

  def characters
    @characters ||=
      filter(filtered_characters).includes(:taggings, :tags).distinct
  end

  # filter to characters available within starts/ends params
  # - no existing colliding events
  # - character starts before the param ends
  # - character ends after the param starts
  def characters_in_timeline(characters, starts, ends)
    return characters if starts.blank? || ends.blank?

    characters.left_joins(:events)
              .where('events.id IS NULL or '\
                     'events.ends <= ? or ? <= events.starts',
                     starts, ends)
              .where('characters.starts is NULL or '\
                     'characters.starts <= ?', ends)
              .where('characters.ends is NULL or characters.ends >= ?', starts)
  end

  def filtered_characters
    matched_characters(
      characters_in_timeline(world.characters,
                             params[:starts],
                             params[:ends]),
      params[:search]
    ).order(sort)
  end

  def matched_characters(characters, search)
    return characters if search.blank?

    characters.where('characters.name like ?', "%#{search}%")
  end

  def permit_character_update
    unless world.can_manage?(session[:user_id]) ||
           (world.can_write?(session[:user_id]) &&
            character.creator_id == session[:user_id])
      not_found
    end
  end

  def render_for_character(success)
    if success
      render json: character.to_full_h.to_camelback_keys
    else
      render json: { error: character.errors.full_messages.join('; ') },
             status: :bad_request
    end
  end
end
