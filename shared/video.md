name: Generate Verification Videos
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday
  workflow_dispatch:      # Manual trigger
    inputs:
      video_count:
        description: 'Number of videos to generate'
        required: true
        default: '5'
      video_type:
        description: 'Type (gif/apng/tiny)'
        required: true
        default: 'tiny'

jobs:
  generate-videos:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
        
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          
      - name: Install dependencies
        run: |
          pip install pillow numpy
          
      - name: Generate verification videos
        env:
          COUNT: ${{ github.event.inputs.video_count || '100' }}
          TYPE: ${{ github.event.inputs.video_type || 'tiny' }}
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          python scripts/generate_videos.py \
            --count $COUNT \
            --type $TYPE \
            --output-dir ./generated-videos/
          
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          name: "Verification Videos ${{ github.event.repository.updated_at }}"
          tag_name: "videos-${{ github.run_number }}"
          files: ./generated-videos/*
          body: |
            ## 🎬 Generated Verification Videos
            
            - **Count**: ${{ github.event.inputs.video_count || '100' }}
            - **Type**: ${{ github.event.inputs.video_type || 'tiny' }}
            - **Total Size**: {{ size }}
            - **Purpose**: DeafAUTH visual verification
            
            These videos are microscopic (<100 bytes each) and ready for deployment.
```