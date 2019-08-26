import * as yup from 'yup';

export const validationSchema = yup.object().shape({
  type: yup.string(),
  param: yup
    .object()
    .when('type', {
      is: 'git',
      then: yup.object({
        url: yup.string().required('Required'),
        revision: yup.string(),
      }),
    })
    .when('type', {
      is: 'image',
      then: yup.object({
        url: yup.string().required('Required'),
      }),
    })
    .when('type', {
      is: 'storage',
      then: yup.object({
        type: yup.string().required('Required'),
        location: yup.string().required('Required'),
        dir: yup.boolean(),
      }),
    })
    .when('type', {
      is: 'cluster',
      then: yup.object({
        url: yup.string().required('Required'),
        username: yup.string().required('Required'),
        password: yup.string(),
        insecure: yup.boolean(),
      }),
    }),
});
