# frozen_string_literal: true

RSpec.shared_examples 'read world items' do
  let(:collection) do
    described_class.to_s.underscore.gsub(/_controller$/, '')
  end
  let(:item_type) { collection.singularize.to_sym }
  let(:creator) { create :user }
  let(:world) { create :world, creator: creator }

  context 'when considering permissions' do
    let!(:items) do
      create_list item_type, 2, world: world
    end

    shared_examples 'reads collection' do
      before { get :index, params: { world_slug: world.slug } }

      it { expect(response).to have_http_status :success }
      it do
        expect(JSON.parse(response.body)[collection])
          .to contain_exactly(*(items.map { |i| hash_including('id' => i.id) }))
      end
    end

    context 'when not logged in' do
      before { get :index, params: { world_slug: world.slug } }

      it { expect(response).to have_http_status :success }
      it { expect(response).to render_template 'worlds/index' }
    end

    context 'when the world is open' do
      let(:world) { create :world, open: true }

      it_behaves_like 'reads collection'
    end

    context 'when logged in' do
      context 'when no permissions' do
        before { login }

        it do
          expect { get :index, params: { world_slug: world.slug } }
            .to raise_error an_instance_of(ActionController::RoutingError)
        end
      end

      context 'when creator' do
        before { login(creator) }

        it_behaves_like 'reads collection'
      end

      shared_examples 'permitted user' do
        before do
          user = create :user
          world.world_permissions
               .create user: user, permission: permission
          login(user)
        end

        it_behaves_like 'reads collection'
      end

      context 'when writer' do
        let(:permission) { WorldPermission::PERMISSION_WRITE }

        it_behaves_like 'permitted user'
      end

      context 'when reader' do
        let(:permission) { WorldPermission::PERMISSION_READ }

        it_behaves_like 'permitted user'
      end
    end
  end

  context 'when filtering to tags' do
    let!(:item1) { create item_type, world: world }
    let!(:item2) { create item_type, world: world }
    let(:tag) do
      tag = create :tag, world: world
      item2.tags << tag
      tag
    end
    before do
      login(world.creator)
      get :index, format: :json,
                  params: { world_slug: world.slug,
                            filter_tags: [tag.id] }
    end
    subject { JSON.parse(response.body)[collection] }

    context 'when filtering after, overlapping' do
      it do
        is_expected.to contain_exactly(hash_including('id' => item2.id))
      end
    end
  end

  context 'when filtering to timeline' do
    let!(:item1) { create item_type, world: world, starts: -100, ends: 200 }
    let!(:item2) { create item_type, world: world, starts: 100, ends: 200 }
    let!(:item3) { create item_type, world: world, starts: 300, ends: 450 }
    let!(:item4) { create item_type, world: world, starts: 400, ends: 600 }
    before do
      login(world.creator)
      get :index, format: :json,
                  params: { world_slug: world.slug }.merge(filter_params)
    end
    subject { JSON.parse(response.body)[collection] }

    context 'when filtering after, overlapping' do
      let(:filter_params) { { filter_starts: 350 } }

      it do
        is_expected.to contain_exactly(hash_including('id' => item3.id),
                                       hash_including('id' => item4.id))
      end
    end

    context 'when filtering after, within' do
      let(:filter_params) { { filter_starts: 350, filter_within: true } }

      it { is_expected.to contain_exactly(hash_including('id' => item4.id)) }
    end

    context 'when filtering before, overlapping' do
      let(:filter_params) { { filter_ends: 350 } }

      it do
        is_expected.to contain_exactly(hash_including('id' => item1.id),
                                       hash_including('id' => item2.id),
                                       hash_including('id' => item3.id))
      end
    end

    context 'when filtering before, within' do
      let(:filter_params) { { filter_ends: 350, filter_within: true } }

      it do
        is_expected.to contain_exactly(hash_including('id' => item1.id),
                                       hash_including('id' => item2.id))
      end
    end
  end

  context 'when paginating' do
    let!(:item1) { create item_type, world: world, starts: 500 }
    let!(:item2) { create item_type, world: world, starts: 200 }
    let!(:item3) { create item_type, world: world, starts: 300 }
    let!(:item4) { create item_type, world: world, starts: 700 }
    before { login(world.creator) }
    subject { JSON.parse(response.body)[collection] }

    context 'when not specifying where to start' do
      before do
        get :index, format: :json, params: { world_slug: world.slug,
                                             per_page: 3 }
      end

      it 'pulls a page from the 0 index' do
        is_expected.to contain_exactly(hash_including('id' => item2.id),
                                       hash_including('id' => item3.id),
                                       hash_including('id' => item1.id))
      end
    end

    context 'when specifying index' do
      before do
        get :index, format: :json, params: { world_slug: world.slug,
                                             from: 1,
                                             per_page: 2 }
      end

      it 'starts from that index' do
        is_expected.to contain_exactly(hash_including('id' => item3.id),
                                       hash_including('id' => item1.id))
      end
    end
  end

  context 'when sorting' do
    let!(:item1) do
      create item_type, world: world, starts: 500, ends: 700, name: 'Drink'
    end
    let!(:item2) do
      create item_type, world: world, starts: 200, ends: 600, name: 'Cranberry'
    end
    let!(:item3) do
      create item_type, world: world, starts: 300, ends: 900, name: 'Banana'
    end
    let!(:item4) do
      create item_type, world: world, starts: 700, ends: 800, name: 'Apple'
    end
    before { login(world.creator) }
    subject { JSON.parse(response.body)[collection].map { |i| i['id'] } }

    context 'when default sorting' do
      before { get :index, format: :json, params: { world_slug: world.slug } }

      it { is_expected.to eq [item2.id, item3.id, item1.id, item4.id] }
    end

    context 'when desc sorting' do
      before do
        get :index, format: :json, params: { sort_by: 'ends',
                                             sort_order: 'desc',
                                             world_slug: world.slug }
      end

      it { is_expected.to eq [item3.id, item4.id, item1.id, item2.id] }
    end

    context 'when sorting by attribute name' do
      before do
        get :index, format: :json, params: { sort_by: 'name',
                                             world_slug: world.slug }
      end

      it { is_expected.to eq [item4.id, item3.id, item2.id, item1.id] }
    end
  end
end

RSpec.shared_examples 'timeline filter world items with nil-able timelines' do
  let(:collection) do
    described_class.to_s.underscore.gsub(/_controller$/, '')
  end
  let(:item_type) { collection.singularize.to_sym }
  let(:creator) { create :user }
  let(:world) { create :world, creator: creator }
  let!(:item1) { create item_type, world: world }
  let!(:item2) { create item_type, world: world, starts: 100 }
  let!(:item3) { create item_type, world: world, ends: 450 }
  let!(:item4) { create item_type, world: world, starts: 150, ends: 300 }
  before do
    login(world.creator)
    get :index, format: :json,
                params: { world_slug: world.slug }.merge(filter_params)
  end
  subject { JSON.parse(response.body)[collection] }

  context 'when filtering after, overlapping' do
    let(:filter_params) { { filter_starts: 350 } }

    it do
      is_expected.to contain_exactly(hash_including('id' => item1.id),
                                     hash_including('id' => item2.id),
                                     hash_including('id' => item3.id))
    end
  end

  context 'when filtering after, within' do
    let(:filter_params) { { filter_starts: 100, filter_within: true } }

    it do
      is_expected.to contain_exactly(hash_including('id' => item2.id),
                                     hash_including('id' => item4.id))
    end
  end

  context 'when filtering before, overlapping' do
    let(:filter_params) { { filter_ends: 120 } }

    it do
      is_expected.to contain_exactly(hash_including('id' => item1.id),
                                     hash_including('id' => item2.id),
                                     hash_including('id' => item3.id))
    end
  end

  context 'when filtering before, within' do
    let(:filter_params) { { filter_ends: 350, filter_within: true } }

    it do
      is_expected.to contain_exactly(hash_including('id' => item4.id))
    end
  end
end

RSpec.shared_examples 'name-searchable world items' do
  let(:collection) do
    described_class.to_s.underscore.gsub(/_controller$/, '')
  end
  let(:item_type) { collection.singularize.to_sym }
  let(:world) { create :world }
  let!(:item1) { create item_type, name: 'Apple', world: world }
  let!(:item2) { create item_type, name: 'Banana', world: world }
  let!(:item3) { create item_type, name: 'Crabapple', world: world }
  before do
    login(world.creator)
    get :index, params: { search: 'appl', world_slug: world.slug }
  end

  it do
    expect(JSON.parse(response.body)[collection])
      .to contain_exactly(hash_including('id' => item1.id),
                          hash_including('id' => item3.id))
  end
end

RSpec.shared_examples 'create world item' do |additional_params = {}|
  let(:item_type) do
    described_class.to_s
                   .underscore
                   .gsub(/_controller$/, '')
                   .singularize.to_sym
  end
  let(:world) { create :world }
  let(:item_attributes) { attributes_for item_type }
  let(:create_params) do
    { world_slug: world.slug,
      item_type => item_attributes }.merge(additional_params)
  end

  shared_examples 'allowed' do
    before { post :create, format: :json, params: create_params }

    it { expect(response).to have_http_status :success }
    it do
      expect(JSON.parse(response.body))
        .to include(item_attributes.to_camelback_keys.stringify_keys)
    end

    context 'when adding and creating tags' do
      let(:add_tag) { create :tag, world: world }
      let(:create_tag) { attributes_for :tag }
      let(:item_attributes) do
        attributes_for(item_type)
          .merge(taggings: { '0' => { tag: add_tag.attributes },
                             '1' => { tag: create_tag } })
      end
      subject do
        JSON.parse(response.body)['taggings']
            .map { |t| t['tag'].slice('name', 'slug') }
      end

      it do
        is_expected
          .to contain_exactly add_tag.attributes.slice('name', 'slug'),
                              create_tag.stringify_keys
      end
    end
  end

  shared_examples 'disallowed' do
    it do
      expect { post :create, format: :json, params: create_params }
        .to raise_error an_instance_of(ActionController::RoutingError)
    end
  end

  context 'when not logged in' do
    it_behaves_like 'disallowed'
  end

  context 'when no permissions' do
    before { login }

    it_behaves_like 'disallowed'
  end

  context 'when read permission' do
    before do
      user = create :user
      world.world_permissions
           .create user: user, permission: WorldPermission::PERMISSION_READ
      login(user)
    end

    it_behaves_like 'disallowed'
  end

  context 'when write permission' do
    before do
      user = create :user
      world.world_permissions
           .create user: user, permission: WorldPermission::PERMISSION_WRITE
      login(user)
    end

    it_behaves_like 'allowed'
  end

  context 'when creator' do
    before { login(world.creator) }

    it_behaves_like 'allowed'
  end

  context 'when invalid params' do
    before do
      login(world.creator)
      post :create, format: :json,
                    params: { world_slug: world.slug,
                              item_type => { starts: 50 } }
    end

    it { expect(response).to have_http_status :bad_request }
    it { expect(JSON.parse(response.body)['error']).to be_present }
  end
end

RSpec.shared_examples 'update world item' do
  let(:item_type) do
    described_class.to_s
                   .underscore
                   .gsub(/_controller$/, '')
                   .singularize.to_sym
  end
  let(:world) { create :world }
  let(:item) { create item_type, world: world }
  let(:item_attributes) { { name: Faker::Lorem.word } }
  let(:update_params) do
    { id: item.id,
      world_slug: world.slug,
      item_type => item_attributes }
  end

  shared_examples 'allowed' do
    before { patch :update, format: :json, params: update_params }

    it { expect(response).to have_http_status :success }
    it do
      expect(JSON.parse(response.body))
        .to include(item_attributes.to_camelback_keys.stringify_keys)
    end

    context 'when adding, creating, and deleting tags' do
      let(:add_tag) { create :tag, world: world }
      let(:create_tag) { attributes_for :tag }
      let(:remove_tag) do
        tag = create :tag, world: world
        item.tags << tag
        tag
      end
      let(:remove_tagging_id) do
        item.taggings
            .find_by(tag_id: remove_tag.id)
            .id
      end
      let(:item_attributes) do
        attributes_for(item_type)
          .merge(taggings: { '0' => { tag: add_tag.attributes },
                             '1' => { tag: create_tag },
                             '2' => { _destroy: true,
                                      id: remove_tagging_id,
                                      tag: remove_tag.attributes } })
      end
      subject do
        JSON.parse(response.body)['taggings']
            .map { |t| t['tag'].slice('name', 'slug') }
      end

      it do
        is_expected
          .to contain_exactly add_tag.attributes.slice('name', 'slug'),
                              create_tag.stringify_keys
      end
    end
  end

  shared_examples 'disallowed' do
    it do
      expect { patch :update, format: :json, params: update_params }
        .to raise_error an_instance_of(ActionController::RoutingError)
    end
  end

  context 'when not logged in' do
    it_behaves_like 'disallowed'
  end

  context 'when no permissions' do
    before { login }

    it_behaves_like 'disallowed'
  end

  context 'when read permission' do
    before do
      user = create :user
      world.world_permissions
           .create user: user, permission: WorldPermission::PERMISSION_READ
      login(user)
    end

    it_behaves_like 'disallowed'
  end

  context 'when write permission' do
    let(:user) do
      user = create :user
      world.world_permissions
           .create user: user, permission: WorldPermission::PERMISSION_WRITE
      user
    end
    before { login(user) }

    it_behaves_like 'disallowed'

    context 'when created item' do
      let(:item) { create item_type, creator: user, world: world }

      it_behaves_like 'allowed'
    end
  end

  context 'when creator' do
    before { login(world.creator) }

    it_behaves_like 'allowed'
  end

  context 'when invalid params' do
    before do
      login(world.creator)
      patch :update, format: :json,
                     params: { id: item.id,
                               world_slug: world.slug,
                               item_type => { name: nil } }
    end

    it { expect(response).to have_http_status :bad_request }
    it { expect(JSON.parse(response.body)['error']).to be_present }
  end
end
