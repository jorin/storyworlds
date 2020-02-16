import RenderService from 'services/render_service';
import Settings from 'components/users/settings';

document.addEventListener('DOMContentLoaded', () => {
  RenderService.render('users', Settings);
});
