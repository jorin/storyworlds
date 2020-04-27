# frozen_string_literal: true

class ByWorldController < ApplicationController
  private

  def add_tag_to_tagging!(tagging, new_tags)
    tagging[:tag_id] = tagging[:tag][:id] ||
                       new_tags
                       .find { |tag| tag.slug == tagging[:tag][:slug] }.id
    tagging.delete(:tag)
  end

  def create_associate_tags!(base_params, taggings)
    new_tags = world.tags
                    .create(taggings.select { |_, v| v[:tag][:id].blank? }
                                    .values.map { |t| t[:tag] })
    taggings.each { |_, tagging| add_tag_to_tagging!(tagging, new_tags) }
    base_params[:taggings_attributes] = taggings
  end

  def filter(collection)
    with_tags(in_timeline(collection))
  end

  def format_tag_params!(base_params)
    if base_params[:taggings].present?
      create_associate_tags!(base_params,
                             base_params.delete(:taggings))
    end

    base_params
  end

  def in_timeline(collection)
    in_timeline_after_starts(in_timeline_before_ends(collection))
  end

  def in_timeline_after_starts(collection)
    return collection if params[:filter_starts].blank?

    coll = collection.where('ends >= ? OR ends IS NULL',
                            params[:filter_starts])
    if ActiveRecord::Type::Boolean.new.deserialize(params[:filter_within])
      coll = collection.where('starts >= ?', params[:filter_starts])
    end
    coll
  end

  def in_timeline_before_ends(collection)
    return collection if params[:filter_ends].blank?

    coll = collection.where('starts <= ? OR starts IS NULL',
                            params[:filter_ends])
    if ActiveRecord::Type::Boolean.new.deserialize(params[:filter_within])
      coll = collection.where('ends <= ?', params[:filter_ends])
    end
    coll
  end

  def page(collection)
    return collection if params[:per_page].blank?

    collection.offset(params[:from] || 0).limit(params[:per_page])
  end

  def permit_modify
    not_found unless world.can_manage?(session[:user_id])
  end

  def permit_read
    return if world&.can_read?(session[:user_id])

    not_found if current_user.present?

    render 'worlds/index'
  end

  def permit_write
    not_found unless world.can_write?(session[:user_id])
  end

  def sort
    sort_by = params[:sort_by]&.to_sym
    if params[:sort_order] == 'desc'
      { sort_by => :desc, starts: :desc, ends: :desc }
    else
      [sort_by, :starts, :ends]
    end
  end

  def with_tags(collection)
    return collection if params[:filter_tags].blank?

    collection.joins(:taggings)
              .where(taggings: { tag_id: params[:filter_tags] })
  end

  def world
    @world ||= World.find_by(slug: params[:world_slug])
  end
end
