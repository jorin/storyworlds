import RenderService from 'services/render_service';
import Header from 'components/global/header';

document.addEventListener('DOMContentLoaded', () => {
  RenderService.render('header', Header);
});
