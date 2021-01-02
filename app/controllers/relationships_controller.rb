# frozen_string_literal: true

class RelationshipsController < ByWorldController
  before_action :permit_read, only: %i[index]
  before_action :permit_relationship_update, only: %i[update]
  before_action :permit_write, only: %i[create]

  def index
    render json: { relationships: page(relationships).map(&:to_full_h),
                   total: relationships.size }.to_camelback_keys
  end

  def create
    @relationship = world.relationships
                         .create(relationship_params
                                 .merge(creator: current_user))
    render_for_relationship(relationship.persisted?)
  end

  def update
    render_for_relationship(relationship.update(relationship_params))
  end

  private

  def applicable_relationships
    with_character_relationships(Relationship.where(relatable_params))
  end

  def permit_relationship_update
    unless world.can_manage?(session[:user_id]) ||
           (world.can_write?(session[:user_id]) &&
            relationship.creator_id == session[:user_id])
      not_found
    end
  end

  def relatable_params
    params.require(:relationship).permit(:relatable_id, :relatable_type)
  end

  def relationship
    @relationship ||= world&.relationships&.find_by(id: params[:id])
  end

  def relationship_params
    params.require(:relationship)
          .permit(:id, :character_id, :description, :ends, :inverse_name,
                  :name, :relatable_id, :relatable_type, :starts)
  end

  def relationships
    @relationships ||= applicable_relationships
  end

  def render_for_relationship(success)
    if success
      render json: relationship.to_full_h.to_camelback_keys
    else
      render json: { error: relationship.errors.full_messages.join('; ') },
             status: :bad_request
    end
  end

  def with_character_relationships(relationships)
    if relatable_params[:relatable_type].constantize != Character
      return relationships
    end

    relationships
      .or(Relationship.where(character_id: relatable_params[:relatable_id]))
  end
end
