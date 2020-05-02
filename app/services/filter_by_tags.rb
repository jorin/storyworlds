# frozen_string_literal: true

class FilterByTags
  attr_accessor :params, :tagged_type

  class << self
    def filter_by_params(collection, tagged_type, params)
      new(tagged_type, params).filter_by_params(collection)
    end
  end

  def initialize(tagged_type, params = {})
    @tagged_type = tagged_type
    @params = params
  end

  def filter_by_params(collection)
    tags_exclusion(tags_inclusion(collection))
  end

  private

  def tags_exclusion(collection)
    return collection if params[:filter_tags_exclude].blank?

    collection.where
              .not(id: Tagging.where(tag_id: params[:filter_tags_exclude],
                                     tagged_type: tagged_type)
                              .select('DISTINCT tagged_id'))
  end

  def tags_inclusion(collection)
    return collection if params[:filter_tags_include].blank?

    if ActiveRecord::Type::Boolean.new.deserialize(params[:filter_tags_and])
      tags_inclusion_and(collection)
    else
      tags_inclusion_or(collection)
    end
  end

  def tags_inclusion_and(collection)
    collection
      .where(id: Tagging.where(tag_id: params[:filter_tags_include],
                               tagged_type: tagged_type)
                        .select(:tagged_id)
                        .group(:tagged_id)
                        .having("count('tagged_id') = "\
                                "#{params[:filter_tags_include].count}"))
  end

  def tags_inclusion_or(collection)
    collection.where(id: Tagging.where(tag_id: params[:filter_tags_include],
                                       tagged_type: tagged_type)
                                .select('DISTINCT tagged_id'))
  end
end
