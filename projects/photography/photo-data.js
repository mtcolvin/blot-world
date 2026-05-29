/**
 * Curated photo data — hand-maintained date and location per photo.
 *
 * This is the source of truth for what appears on the photography page.
 * Edit `date` (YYYY-MM-DD) and `location` (free-form string) here directly.
 * Add a new photo: drop the file in /images/ and add an entry below.
 * Photos are sorted chronologically at render time, so order here doesn't matter.
 *
 * Consumed by projects/photography/photography.html as `window.BLOT_PHOTOS`.
 */
(function () {
    "use strict";

    window.BLOT_PHOTOS = [
        { file: '68223264_Unknown.JPG',                   date: '2017-08-21', location: '' },

        { file: 'IMG_1325_result.jpg',                    date: '2024-06-22', location: 'Marco Island, FL' },
        { file: 'IMG_1395_result.jpg',                    date: '2024-06-28', location: 'Longboat Key, FL' },
        { file: 'IMG_1992_result_1.jpg',                  date: '2024-08-12', location: 'Timnath, CO' },
        { file: 'IMG_2010_result_1.jpg',                  date: '2024-08-13', location: 'Loveland, CO' },
        { file: 'image0.jpeg',                            date: '2024-12-10', location: 'Timnath, CO' },

        { file: 'IMG_4037_result_1.jpg',                  date: '2025-01-14', location: 'Fort Collins, CO' },
        { file: 'IMG_5567_result.jpg',                    date: '2025-03-10', location: 'Timnath, CO' },
        { file: 'IMG_6346_result_1.jpg',                  date: '2025-04-04', location: 'Florida Keys' },
        { file: 'IMG_6582_result.jpg',                    date: '2025-04-09', location: 'Miami, FL' },
        { file: 'IMG_7624_result_1.jpg',                  date: '2025-05-29', location: 'Lory State Park, CO' },

        { file: 'IMG_8332_result.jpg',                    date: '2025-06-17', location: 'near Castrocielo, Italy' },
        { file: 'IMG_8419_result.jpg',                    date: '2025-06-17', location: 'Castellammare di Stabia, Italy' },
        { file: 'IMG_8446_result.jpg',                    date: '2025-06-17', location: 'Montechiaro, Italy' },
        { file: 'IMG_8464_result.jpg',                    date: '2025-06-18', location: 'Sorrento, Italy' },
        { file: 'IMG_8493_result.jpg',                    date: '2025-06-18', location: 'Anacapri, Italy' },
        { file: 'IMG_8513_result.jpg',                    date: '2025-06-18', location: 'Anacapri, Italy' },
        { file: 'IMG_8606_result.jpg',                    date: '2025-06-18', location: 'Marina Grande, Italy' },
        { file: 'IMG_8612_result.jpg',                    date: '2025-06-18', location: 'Marina Grande, Italy' },
        { file: 'IMG_8727_result.jpg',                    date: '2025-06-19', location: 'Castellammare di Stabia, Italy' },
        { file: 'IMG_8739_result.jpg',                    date: '2025-06-19', location: 'Torre del Greco, Italy' },
        { file: 'IMG_8818_result.jpg',                    date: '2025-06-19', location: 'Naples, Italy' },
        { file: 'IMG_9007_result.jpg',                    date: '2025-06-20', location: 'Amasona, Italy' },
        { file: 'IMG_9017_result.jpg',                    date: '2025-06-20', location: 'near Attigliano, Italy' },

        { file: 'IMG_9810_result_1.jpg',                  date: '2025-08-03', location: 'Queens, NY' },
        { file: 'IMG_0236_result.jpg',                    date: '2025-09-08', location: 'Denver, CO' },
        { file: 'vlcsnap-2025-11-12-02h05m05s496.jpg',    date: '2025-09-20', location: 'near Loveland, CO' },
        { file: 'IMG_0772_result.jpg',                    date: '2025-10-21', location: 'near Hygiene, CO' },

        { file: 'IMG_0955_result.jpg',                    date: '2025-11-02', location: 'Denver, CO' },
        { file: 'IMG_0966_result.jpg',                    date: '2025-11-02', location: 'Denver, CO' },
        { file: 'IMG_0969_result.jpg',                    date: '2025-11-02', location: 'Denver, CO' },
        { file: 'IMG_1238_result2.jpg',                   date: '2025-11-09', location: 'Grand Junction, CO' },
        { file: 'IMG_1264_result1.jpg',                   date: '2025-11-09', location: 'Grand Junction, CO' },
        { file: 'IMG_1443_result_1.jpg',                  date: '2025-11-13', location: 'Fort Collins, CO' },
        { file: 'IMG_1463_result.jpg',                    date: '2025-11-16', location: 'near Poudre Canyon, CO' },
        { file: 'IMG_1507_result.jpg',                    date: '2025-11-24', location: 'near Timnath, CO' },
        { file: 'IMG_1574_result.jpg',                    date: '2025-11-27', location: 'Heber City, UT' },
        { file: 'IMG_1648_result.jpg',                    date: '2025-11-28', location: 'Hidden Peak, UT' },
        { file: 'IMG_1649_result.jpg',                    date: '2025-11-28', location: 'Hidden Peak, UT' },
        { file: 'IMG_1659_result.jpg',                    date: '2025-11-28', location: 'Hidden Peak, UT' },

        { file: 'IMG_1850_result.jpg',                    date: '2025-12-08', location: 'Estes Park, CO' },
        { file: 'IMG_1867_result.jpg',                    date: '2025-12-08', location: 'Estes Park, CO' },
        { file: 'IMG_1907_result.jpg',                    date: '2025-12-08', location: 'Rocky Mountain NP, CO' },
        { file: 'IMG_1914_result.jpg',                    date: '2025-12-08', location: 'Rocky Mountain NP, CO' },
        { file: 'IMG_1936_result.jpg',                    date: '2025-12-08', location: 'Greeley, CO' },
        { file: 'IMG_2020_result.jpg',                    date: '2025-12-14', location: 'Fort Collins, CO' },
        { file: 'IMG_2106_result.jpg',                    date: '2025-12-17', location: 'Fort Collins, CO' },
        { file: 'IMG_2662.jpg',                           date: '2025-12-19', location: '' },
        { file: 'IMG_2689.jpg',                           date: '2025-12-19', location: '' },
        { file: 'IMG_2807.jpg',                           date: '2025-12-19', location: '' },
        { file: 'IMG_2976.jpg',                           date: '2025-12-19', location: '' },
        { file: 'IMG_2980.jpg',                           date: '2025-12-19', location: '' },
        { file: 'IMG_3017.jpg',                           date: '2025-12-19', location: '' },
        { file: 'IMG_2201_result.jpg',                    date: '2025-12-22', location: 'Greeley, CO' },
        { file: 'IMG_2288_result.jpg',                    date: '2025-12-28', location: 'Berthoud, CO' },
        { file: 'IMG_2319_result.jpg',                    date: '2025-12-29', location: 'Wyoming' },
        { file: 'IMG_2397_result.jpg',                    date: '2025-12-30', location: 'Park City, UT' },

        { file: 'IMG_2596_result.jpg',                    date: '2026-01-17', location: 'Greeley, CO' },
        { file: 'IMG_2719.jpg',                           date: '2026-01-28', location: 'Fort Collins, CO' },

        { file: 'IMG_2780.jpg',                           date: '2026-02-10', location: 'Mead, CO' },
        { file: 'IMG_2812.jpg',                           date: '2026-02-14', location: 'Loveland, CO' },
        { file: 'IMG_2857.jpg',                           date: '2026-02-18', location: 'Timnath, CO' },
        { file: 'IMG_2891.jpg',                           date: '2026-02-21', location: 'Loveland, CO' },
        { file: 'IMG_2939.jpg',                           date: '2026-02-26', location: 'Timnath, CO' },

        { file: 'IMG_3010.jpg',                           date: '2026-03-05', location: 'Fort Collins, CO' },
        { file: 'IMG_3089.jpg',                           date: '2026-03-14', location: 'Timnath, CO' },
        { file: 'IMG_3158.jpg',                           date: '2026-03-20', location: 'Fort Collins, CO' },
        { file: 'IMG_3287.jpg',                           date: '2026-03-28', location: 'Bobcat Ridge Natural Area, CO' },
        { file: 'IMG_3298.jpg',                           date: '2026-03-29', location: 'Loveland, CO' }
    ];
})();
